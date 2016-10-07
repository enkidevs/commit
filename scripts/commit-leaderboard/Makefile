clean:
	echo "Cleaning commit-leaderboard"
	rm -rf dist

prepare: clean
	echo "Preparing commit-leaderboard"
	npm i

build: prepare
	echo "Building leaderboard"
	mkdir dist && \
	babel ./src --out-dir ./dist && \
	cp package.json dist/

publish: build
	cd dist && \
	git init && \
	git add . && \
	git commit --allow-empty -am 'Update commit-leaderboard' && \
	heroku git:remote -a commit-leaderboard && \
	git push heroku master --force

heroku-init: clean
	cd dist && \
	git init && \
	heroku git:remote -a commit-leaderboard && \
	heroku addons:create scheduler:standard && \
	heroku buildpacks:set heroku/nodejs -a commit-leaderboard

.PHONY: clean prepare build publish
.SILENT: clean prepare build publish
