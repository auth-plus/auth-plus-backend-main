# Auth+ Authentication

[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=auth-plus_auth-plus-authentication&metric=coverage)](https://sonarcloud.io/summary/new_code?id=auth-plus_auth-plus-authentication)

[![Test Coverage](https://api.codeclimate.com/v1/badges/01f194165a4526cd5001/test_coverage)](https://codeclimate.com/github/auth-plus/auth-plus-authentication/test_coverage)

[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/b8c826b4250b4000945bd3e305e3e443)](https://www.codacy.com/gh/auth-plus/auth-plus-authentication/dashboard?utm_source=github.com&utm_medium=referral&utm_content=auth-plus/auth-plus-authentication&utm_campaign=Badge_Coverage)

This project it's a sample for authentication system. It use a hexagonal architeture with layer for dependency manager.

## Pré-requisite

- Docker v20.10.11
- Docker Compose v1.28.4
- Node v18.12.1
- Minikube v1.23.1

## Commands

```bash

# rise/destroy all dependency
make infra/up # already create tables based on ./db/schema.sql
make infra/down # does not remove volume

# make test on the same condition where it's executed on CI
make test

# developer and test enviroment
make dev

# clean
make clean/docker # prune for container, volumes and image
make clean/node # node_modules folder and package-lock remove

# Minikube
make k8s/up # make minikube deployment based on local Dockerfile
make k8s/down # remove service from k8s and minikube stop
```

## Link after infra build up

- Kafdrop: <http://localhost:19000/>
- Redis-Commander: <http://localhost:8081/>
- Grafana: <http://localhost:3000/>
- Kibana: <http://localhost:5601/>
- Jaeger: <http://localhost:16686/>

## TODO

- [ ] Add Role
- [ ] Add Permission
- [ ] Add Vault from HashiCorp
- [ ] Finish local minikube
- [ ] Add decorator to inject dependencies instead of layer management
