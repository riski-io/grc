import util from 'util';

export default (schema, _options) => {
	const options = {
		toJSON: true,
		toObject: true,
	};
	const transform = (doc, ret) => {
		ret.id = ret._id;
		delete ret._id;
		delete ret.__v;
		if (ret.__t) {
			delete ret.__t;
		}
	};

	util._extend(options, _options);

	if (options.toJSON) {
		schema.options.toJSON = schema.options.toJSON || {};
		schema.options.toJSON.transform = transform;
		schema.set('toJSON', schema.options.toJSON);
	}

	if (options.toObject) {
		schema.options.toObject = schema.options.toObject || {};
		schema.options.toObject.transform = transform;
		schema.set('toObject', schema.options.toObject);
	}
};