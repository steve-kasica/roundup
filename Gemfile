source "https://rubygems.org"

gem "jekyll", "~> 4.3.0"
gem "just-the-docs", "~> 0.8.0"
gem "kramdown-parser-gfm", "~> 1.1"

group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.17.0"
  gem "jekyll-seo-tag", "~> 2.8.0"
  gem "jekyll-sitemap", "~> 1.4.0"
end

# Windows timezone issue
install_if -> { Gem.win_platform? } do
  gem "wdm", "~> 0.1.1"
  gem "tzinfo", "~> 2.0"
  gem "tzinfo-data", "~> 1.2022"
end
