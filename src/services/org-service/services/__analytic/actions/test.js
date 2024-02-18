export default {
  async handler(ctx) {
    return ctx.call(
      'v1.analytic.skillset.top',
      {
        type: 'soft_skill',
      },
      {
        meta: {
          orgId: '<commandsee-test>',
        },
      },
    )
  },
}
