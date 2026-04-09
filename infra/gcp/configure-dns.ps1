param(
  [string]$ProjectId = "mydarrin-platform",
  [string]$ZoneName = "homebestpal-zone",
  [string]$FrontendDomain = "mydarrin.homebestpal.com",
  [string]$AdminDomain = "admin.mydarrin.homebestpal.com",
  [string]$ApiDomain = "api.mydarrin.homebestpal.com",
  [string]$FrontendTarget = "ghs.googlehosted.com.",
  [string]$AdminTarget = "ghs.googlehosted.com.",
  [string]$ApiTarget = "ghs.googlehosted.com."
)

$ErrorActionPreference = "Stop"

gcloud config set project $ProjectId

gcloud dns record-sets transaction start --zone=$ZoneName
gcloud dns record-sets transaction add $FrontendTarget --name="$FrontendDomain." --ttl=300 --type=CNAME --zone=$ZoneName
gcloud dns record-sets transaction add $AdminTarget --name="$AdminDomain." --ttl=300 --type=CNAME --zone=$ZoneName
gcloud dns record-sets transaction add $ApiTarget --name="$ApiDomain." --ttl=300 --type=CNAME --zone=$ZoneName
gcloud dns record-sets transaction execute --zone=$ZoneName
