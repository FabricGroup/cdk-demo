# Useful commands

- `yarn cdk-synth` emits the synthesized CloudFormation template
- `yarn cdk-deploy` deploys given stack
- `yarn bootstrap` deploys base infrastructure stack

## Agenda

### Container

- local running simple container
  - checkout goose repo `git clone git@github.com:FabricGroup/goose.git`
  - build container `make build`
  - run container `make start`
  - verify running container `curl localhost:8083/goo`
  - health check is at `curl localhost:8083/`
- bootstrap cdk deployment infrastructure
  - deploy infra-stack
  - self updating infrastructure with cdk-setup-stack
- deploy 
- cdk deploy single instance to fargate
- gitops: increase number of instances

### Post Demo
- talk about what we do with this
- patterns for distributing as libraries at an organization level
- multi-account deployment pipelines
- embedding security practices
- what is happening in this space?
