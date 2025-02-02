import fastify, { FastifyPluginCallback } from "fastify";
import { expectAssignable, expectType } from "tsd";
import helmet from "helmet";
import fastifyHelmet, { FastifyHelmetOptions } from ".";

const app = fastify();

app.register(fastifyHelmet);
app.register(fastifyHelmet, {});

const helmetOptions = {
  contentSecurityPolicy: false,
  dnsPrefetchControl: false,
  expectCt: false,
  frameguard: false,
  hidePoweredBy: false,
  hsts: false,
  ieNoOpen: false,
  noSniff: false,
  permittedCrossDomainPolicies: false,
  referrerPolicy: false,
  xssFilter: false
};

expectAssignable<FastifyHelmetOptions>(helmetOptions);
app.register(fastifyHelmet, helmetOptions);

app.register(fastifyHelmet, {
  contentSecurityPolicy: {
    directives: {
      'directive-1': ['foo', 'bar']
    },
    reportOnly: true
  },
  dnsPrefetchControl: {
    allow: true
  },
  expectCt: {
    maxAge: 1,
    enforce: true,
    reportUri: 'foo'
  },
  frameguard: {
    action: 'foo'
  },
  hsts: {
    maxAge: 1,
    includeSubDomains: true,
    preload: true
  },
  permittedCrossDomainPolicies: {
    permittedPolicies: 'foo'
  },
  referrerPolicy: {
    policy: 'foo'
  },
  // these options are false or never
  // hidePoweredBy: false
  // ieNoOpen: false,
  // noSniff: false,
  // xssFilter: false
});


app.register(fastifyHelmet, { enableCSPNonces: true });
app.register(fastifyHelmet, {
  enableCSPNonces: true,
  contentSecurityPolicy: {
    directives: {
      'directive-1': ['foo', 'bar']
    },
    reportOnly: true
  },
});
app.get('/', function(request, reply) {
  expectType<{
    script: string
    style: string
  }>(reply.cspNonce)
})

const csp = fastifyHelmet.contentSecurityPolicy;
expectType<typeof helmet.contentSecurityPolicy>(csp);

// fastify-helmet instance is using the FastifyHelmetOptions options
expectType<FastifyPluginCallback<FastifyHelmetOptions> & {
  contentSecurityPolicy: typeof helmet.contentSecurityPolicy;
}>(fastifyHelmet);
