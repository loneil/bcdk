"use strict";
const { OpenShiftClientX } = require("pipeline-cli");
const path = require("path");

module.exports = settings => {
  const phases = settings.phases;
  const oc = new OpenShiftClientX({ namespace: phases.build.namespace });
  const phase = "build";
  let objects = [];
  const templatesLocalBaseUrl = oc.toFileUrl(path.resolve(__dirname, "../../openshift"));

  objects = objects.concat(
    oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/python-chain-build.yaml`, {
      param: {
        NAME: `<%= name%>`,
        SUFFIX: phases[phase].suffix,
        VERSION: phases[phase].tag,
        SOURCE_REPOSITORY_URL: oc.git.http_url,
        SOURCE_REPOSITORY_REF: oc.git.ref,
        SOURCE_BASE_CONTEXT_DIR: ".",
        SOURCE_CONTEXT_DIR: ".",
      },
    }),
  );

  oc.applyRecommendedLabels(
    objects,
    phases[phase].name,
    phase,
    phases[phase].changeId,
    phases[phase].instance,
  );
  oc.applyAndBuild(objects);
};
