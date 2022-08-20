
all: \
	fetch_all_supports \
	public/supports.json \
	public/categories/life_stage_categories.json \
	public/categories/personal_service_categories.json \
	public/categories/personal_purpose_categories.json \
	public/categories/support_categories.json \
	public/categories/situation_categories.json \
	public/categories/request_categories.json \
	public/categories/target_categories.json

clean:
	rm ./tmp/supports/*

.PHONY: fetch_all_supports
fetch_all_supports:
	mkdir -p ./tmp/supports
	bash ./scripts/fetch_all_supports.sh

public/supports.json:
	jq -s '.[0].items=([.[].items]|flatten)|.[0]' tmp/supports/*.json > public/supports.json

tmp/words.txt:
	jq -r '[.items[] | .summary][]' public/supports.json | ginzame -s C | grep 名詞 | cut -f 1 > tmp/words.txt

public/words.json:
	cat tmp/words.txt | sort | uniq | awk '{ print length, $0 }' | sort -n -s -r | cut -d" " -f2- | \
	sed '/[^a-zA-Z0-9]/!d' | head -330 | jq -nR '[inputs | select(length>0)]' > public/words.json

public/categories/life_stage_categories.json: public/supports.json
	jq '[.items[] | .life_stage_categories[]] | unique' public/supports.json > public/categories/life_stage_categories.json

public/categories/personal_service_categories.json: public/supports.json
	jq '[.items[] | .personal_service_categories[]] | unique' public/supports.json > public/categories/personal_service_categories.json

public/categories/personal_purpose_categories.json: public/supports.json
	jq '[.items[] | .personal_purpose_categories[]] | unique' public/supports.json > public/categories/personal_purpose_categories.json

public/categories/support_categories.json: public/supports.json
	jq '[.items[] | .support_categories[]] | unique' public/supports.json > public/categories/support_categories.json

public/categories/situation_categories.json: public/supports.json
	jq '[.items[] | .situation_categories[]] | unique' public/supports.json > public/categories/situation_categories.json

public/categories/request_categories.json: public/supports.json
	jq '[.items[] | .request_categories[]] | unique' public/supports.json > public/categories/request_categories.json

public/categories/target_categories.json: public/supports.json
	jq '[.items[] | .target_categories[]] | unique' public/supports.json > public/categories/target_categories.json

#public/industry_categories.json:
#public/stage_categories:
#public/service_categories:
#public/perpose_categories:
#public/specific_measure_categories:
#public/municipality_specific_measure_categories:


.PHONY: build_search_json
build_search_json:
	bash ./scripts/build_search_json.sh
