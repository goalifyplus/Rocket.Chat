const goalifyConfig = Assets.getText('goalify/goalify-custom-configs.json');
const goalifyPermission = Assets.getText('goalify/goalify-permissions.json');

const S3BUCKETID = 'FileUpload_S3_Bucket';
const subDomain = process.env.SUBDOMAIN || 'newcompany';

Meteor.startup(function() {
	Meteor.defer(function() {
		JSON.parse(goalifyConfig).forEach(config => {
			const cf = RocketChat.models.Settings.findOne({ _id: config._id });
			if (!cf || cf.packageValue === cf.value) {
				const newConfig = Object.assign({}, config);
				delete newConfig._updatedAt;
				delete newConfig.createdAt;
				// newConfig.readonly = true;
				if (newConfig._id === S3BUCKETID) {
					const newValue = newConfig.value.replace('${subdomain}', subDomain);
					newConfig.value = newValue;
					const newMeteorSettingsValue = newConfig.meteorSettingsValue.replace('${subdomain}', subDomain);
					newConfig.meteorSettingsValue = newMeteorSettingsValue;
				}
				RocketChat.models.Settings.upsert({ _id: newConfig._id }, newConfig, err => {
					if (err) {
						console.log(err);
					} else {
						console.log('update ', newConfig._id);
					}
				});
			}
		});

		JSON.parse(goalifyPermission).forEach(permission => {
			const pm = RocketChat.models.Permissions.findOne({ _id: permission._id});
			if (!pm || !pm.isNewValue) {
				const newPermission = Object.assign({}, permission);
				delete newPermission._updatedAt;
				newPermission.isNewValue = true;
				RocketChat.models.Permissions.upsert({ _id: newPermission._id }, newPermission, err => {
					if (err) {
						console.log(err);
					} else {
						console.log('update', newPermission._id);
					}
				});
			}
		});
	});
});
