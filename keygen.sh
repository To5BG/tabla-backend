#!/bin/bash

# For 512-bit hashing
rm secrets.txt
for i in {1..4}
do 
  echo -e "\nSYMMETRIC SECRET #$i:\n"
  SEC=$(openssl rand -base64 87 | tr -d '\n')
  echo $SEC; 
  # echo $SEC >> secrets.txt; echo -e '\n' >> secrets.txt;
done

# For 384-bit eliptic hashing
echo -e "\nASSYMETRIC KEYS:\n"
# Private
openssl ecparam -name secp384r1 -genkey -noout -out jwtES384key.pem
#openssl ecparam -name secp384r1 -genkey -noout -out jwtES384key.pem
# echo "JWT_ACCESS_TOKEN=$(cat jwtES384key.pem)" >> .env
# Public
openssl ec -in jwtES384key.pem -pubout -out jwtES384pubkey.pem