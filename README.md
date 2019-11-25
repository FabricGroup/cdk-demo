# Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template

## Agenda

### Container

- local running simple container
  - chekcout goose repo `git clone git@github.com:FabricGroup/goose.git`
  - build container `make build`
  - run container `make build`
  - verify running container `curl localhost:8083/goo`
  - health check is at `curl localhost:8083/heartbeat`
- setup pipeline using cdk
- deploy same using pipeline
- cdk deploy single instance to fargate
- gitops: increase number of instances
- gitops: add lb

### After every step

- cf walkthrough

### Post Demo

- talk about current work
