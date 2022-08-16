
endpoint="https://webapi.myseido-navi.go.jp/supports"
params="?detail=1&get_expired=false&sort=popularity&order=desc&limit=30"
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
