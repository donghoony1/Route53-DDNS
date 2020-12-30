# Route53-DDNS
Dynamic DNS for Amazon Route 53

Compatible with x86 and Apple Silicon.

## How to run?
```
$ docker run -d --name route53-ddns \
    -e "AWS_ACCESS_KEY_ID=<AWS Access Key Id goes here>" \
    -e "AWS_SECRET_ACCESS_KEY=<AWS Access Key Id goes here>" \
    -e "hosted_zone_id=<AWS Route 53 hosted zone id goes here>" \
    -e "name=<Name goes here>" \
    docker.pkg.github.com/donghoony1/route53-ddns/route53-ddns:1.0.0
```