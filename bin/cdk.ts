#!/usr/bin/env node
import 'source-map-support/register'
import { App } from '@aws-cdk/core'
import { InfraStack } from '../lib/infra-stack'

const app = new App()
const defaultStackProps = {
    tags: {
        'cdk-demo': 'true'
    }
}

new InfraStack(app, 'infra-stack', defaultStackProps)
