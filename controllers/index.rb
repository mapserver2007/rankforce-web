require 'cgi'
require 'json'
require 'sinatra/json'

get '/' do
  # @boards = board_map.to_json
  haml :index
end

get '/:thread_id' do
  # data = MongoLab.find_by_id(thread_id)

  # @title = data['title']
  # @summary = CGI.unescapeHTML(data['summary'])
  @thread_id = params['thread_id'] # TODO validate
  haml :index
end

# Ajax access
get '/rest/:thread_id' do
  data = MongoLab.find_by_id(params['thread_id'])
  json({
    :title   => data['title'],
    :summary => CGI.unescapeHTML(data['summary']),
    :url     => data['url'],
    :ikioi   => data['ikioi'],
    :tweet   => {
      :retweet => data['retweet'],
      :favorite => data['favorite'],
      :reply => data['reply']
    }
  })
end

get '/rest/recent/:num' do
  data_list = MongoLab.recent(params['num'])
  json data_list.inject([]) {|list, data|
    list << {
      :id => data['id'],
      :title => data['title'],
      :ikioi => data['ikioi']['average']
    }
  }
end

get '/rest/ranking/today/:num' do
  data_list = MongoLab.today_ranking(params['num'])
  json data_list.inject([]) {|list, data|
    list << {
      :id => data['id'],
      :title => data['title'],
      :ikioi => data['ikioi']['average']
    }
  }
end

get '/rest/ranking/month/:num' do

end


