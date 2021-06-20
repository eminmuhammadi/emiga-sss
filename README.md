# emiga-sss
Shamir's secret sharing alogrithm implementation on Restful API

### Start
via docker with the help of ```pm2```

```
docker-compose up
```

or,

```
yarn dev
```


## Generate
- POST
  - secret: string
  - parts: number
  - quorum: number
- http://localhost:3000/generate

## Join
- POST
  - parts: []
- http://localhost:3000/join
 
