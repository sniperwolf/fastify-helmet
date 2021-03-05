'use strict'

const fp = require('fastify-plugin')
const helmet = require('helmet')
const crypto = require('crypto')

module.exports = fp(function (app, options, next) {
  const enableCSPNonces = options.enableCSPNonces
  // clear options as helmet will throw when any options is "true"
  options.enableCSPNonces = undefined

  const middleware = helmet(options)

  app.addHook('onRequest', function (req, reply, next) {
    middleware(req.raw, reply.raw, next)
  })

  if (enableCSPNonces) {
    // outside onRequest hooks so that it can be reused in every route
    const cspDirectives = options.contentSecurityPolicy ? options.contentSecurityPolicy.directives : helmet.contentSecurityPolicy.getDefaultDirectives()
    const cspReportOnly = options.contentSecurityPolicy ? options.contentSecurityPolicy.reportOnly : undefined

    app.decorateReply('cspNonce', null)
    app.addHook('onRequest', function (req, reply, next) {
      // create csp nonce
      reply.cspNonce = {
        script: crypto.randomBytes(16).toString('hex'),
        style: crypto.randomBytes(16).toString('hex')
      }

      // push nonce to csp
      // allow both script-src or scriptSrc syntax
      const scriptKey = Array.isArray(cspDirectives['script-src']) ? 'script-src' : 'scriptSrc'
      cspDirectives[scriptKey] = Array.isArray(cspDirectives.scriptSrc) ? cspDirectives.scriptSrc : []
      cspDirectives[scriptKey].push('nonce-' + reply.cspNonce.script)
      // allow both style-src or styleSrc syntax
      const styleKey = Array.isArray(cspDirectives['style-src']) ? 'style-src' : 'styleSrc'
      cspDirectives[styleKey] = Array.isArray(cspDirectives.styleSrc) ? cspDirectives.styleSrc : []
      cspDirectives[styleKey].push('nonce-' + reply.cspNonce.style)

      const cspMiddleware = helmet.contentSecurityPolicy({ directives: cspDirectives, reportOnly: cspReportOnly })
      cspMiddleware(req.raw, reply.raw, next)
    })
  }

  next()
}, {
  fastify: '3.x',
  name: 'fastify-helmet'
})

module.exports.contentSecurityPolicy = helmet.contentSecurityPolicy
