require 'net/https'
require 'active_support'
require 'active_support/time'
require 'active_support/core_ext'

module Model
  HOST = 'api.mongolab.com'
  PATH = '/api/1/databases/%s/collections/%s'

  def self.included(klass)
    klass.extend ModelBase
  end

  module ModelBase
    def self.config=(file)
      @@conf = File.exist?(file) ? YAML.load_file(file) : ENV
      @@path = PATH % [@@conf['database'], @@conf['collection']]
    end

    def mongo
      init_query
      self
    end

    def cond(map)
      @@query[:cond] = map
      self
    end

    def skip(n)
      @@query[:skip] = n
      self
    end

    def limit(n)
      @@query[:limit] = n
      self
    end

    def sort(col, order = :asc)
      @@query[:sort] = {col => {:asc => 1, :desc => -1}[order]}
      self
    end

    def get
      response = nil
      qs_list = ["apiKey=#{@@conf['apikey']}"]
      qs_list << "q=#{@@query[:cond].to_json}" if @@query.key?(:cond)
      qs_list << "sk=#{@@query[:skip]}" if @@query.key?(:skip)
      qs_list << "l=#{@@query[:limit]}" if @@query.key?(:limit)
      qs_list << "s=#{@@query[:sort].to_json}" if @@query.key?(:sort)
      https_start do |https|
        response = JSON.parse(https.get(@@path + "?" + qs_list.join("&")).body)
      end
      init_query
      response
    end

    private

    def init_query
      @@query = {:skip => 0, :limit => 10}
    end

    def https_start
      Net::HTTP.version_1_2
      https = Net::HTTP.new(HOST, 443)
      https.use_ssl = true
      https.verify_mode = OpenSSL::SSL::VERIFY_NONE
      https.start { yield https }
    end

    def load_config(filepath)
      File.exist?(filepath) ? YAML.load_file(filepath) : ENV
    end
  end
end

class MongoLab
  include Model

  def self.find_by_id(id)
    mongo
      .cond({:id => id})
      .get[0]
  end

  def self.recent(num)
    mongo
      .sort('id', :desc)
      .skip(0)
      .limit(num)
      .get
  end

  def self.today_ranking(num)
    mongo
      .cond({:created_at => {"$gte" => Date.today.to_time, "$lt" => Date.tomorrow.to_time}})
      .sort('ikioi.average', :desc)
      .skip(0)
      .limit(num)
      .get
  end

  def self.monthly_ranking(num)

  end

end