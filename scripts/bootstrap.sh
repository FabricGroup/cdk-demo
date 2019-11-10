#!/usr/bin/env sh

yarn cdk deploy infra-stack
DEPLOYMENT_ROLE=$(aws cloudformation describe-stacks --stack-name infra-stack --query "Stacks[0].Outputs[0].OutputValue" --output text)
yarn cdk deploy cdk-deploy-stack --role-arn "$DEPLOYMENT_ROLE"
