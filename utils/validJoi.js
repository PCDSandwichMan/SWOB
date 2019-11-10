const joi = require('@hapi/joi');

module.exports = {
  validateBody: schema => {
    return async (req, res, next) => {
      const result = await schema.validate(req.body);
      if (result.error) {
        // TODO fix weird error
        return res.status(400).json({ error: result.error.toString().substring(7) });
      }

      if (!req.value) req.value = {};
      req.value['body'] = result.value;
      next();
    };
  },

  schemas: {
    squadCreation: joi.object().keys({
      squadName: joi
        .string()
        .required()
        .error(new Error('Must include a squad name')),
      grandAdmiral: joi.string()
    }),
    squadUpdates: joi.object().keys({
      squadName: joi
        .string()
        .required()
        .error(new Error('must include squad string (empty ok)')),
      removeMembers: joi
        .array()
        .required()
        .error(new Error('must include removeMembers array (empty ok)'))
    })
  }
};
