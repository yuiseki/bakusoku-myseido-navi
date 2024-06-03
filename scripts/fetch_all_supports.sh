
endpoint="https://webapi.public-service.registries.go.jp/v1/supports/myseido"
params="?accesskey=Seido202_read&detail=0&disaster=none&get_expired=false&sort=popularity&order=desc&limit=30&personal=true&municipal=false&business=false"
url="${endpoint}${params}"

echo $url

firstoutfile="./tmp/supports/supports-0.json"
if [ ! -e $firstoutfile ]; then
  sleep 1.5

  time curl \
    -s \
    -o - \
    "$url&offset=0" | jq . > $firstoutfile
fi

echo $firstoutfile
total=`cat $firstoutfile | jq -r .total`
total=$((total-1))
echo $total

i=30
while [ "$i" -le $total ]; do
  echo "----- -----"
  echo "$i / $total"
  outfile="./tmp/supports/supports-$i.json"
  echo $outfile
  if [ ! -e $outfile ]; then
    sleep 1.5

    time curl \
      -s \
      -o - \
      "$url&offset=$i" | jq . > $outfile
  fi
  i=$((i+30))
  echo $i
  echo "----- -----"
done
