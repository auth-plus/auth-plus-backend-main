import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api'
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { Resource } from '@opentelemetry/resources'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions'

import { getEnv } from '../config/enviroment_config'

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO)

// Optionally register instrumentation libraries
registerInstrumentations({
  instrumentations: [],
})

const resource = Resource.default().merge(
  new Resource({
    [ATTR_SERVICE_NAME]: getEnv().app.name,
    [ATTR_SERVICE_VERSION]: '0.1.0',
  })
)

const provider = new NodeTracerProvider({
  resource: resource,
})
const exporter = new ZipkinExporter({
  url: getEnv().zipkin.url,
})
const processor = new BatchSpanProcessor(exporter)
provider.addSpanProcessor(processor)

provider.register()
