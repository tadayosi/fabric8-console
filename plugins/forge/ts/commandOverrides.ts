/// <reference path="../../includes.ts"/>
/// <reference path="forgeHelpers.ts"/>
/// <reference path="forgePlugin.ts"/>

module Forge {

  /**
   * Overrides the default schema and look and feel of JBoss Forge commands
   */
  export function configureCommands($timeout, $templateCache, commandId, entity, schema) {
    var properties = schema.properties || {};
    if (commandId === "project-new") {
      schema.controls = ["type", "*"];

      // lets hide the target location!
      var overwrite = properties.overwrite;
      var catalog = properties.catalog;
      var targetLocation = properties.targetLocation;
      var archetype = properties.archetype;
      var named = properties.named;
      named.title = "Name";

      var projectType = properties.type || {};
      projectType.formTemplate = $templateCache.get("forgeProjectTypeChooser.html");

      if (targetLocation) {
        targetLocation.hidden = true;
        if (overwrite) {
          overwrite.hidden = true;
        }
        console.log("hiding targetLocation!");

        // lets default the type
/*
        if (!entity.type) {
          entity.type = "From Archetype Catalog";
        }
*/
      }
      if (catalog) {
        if (!entity.catalog) {
          entity.catalog = "fabric8";
        }
      }
      if (archetype) {
        archetype.formTemplate = $templateCache.get("devOpsArchetypeChooser.html");
      }

      // lets hide fields if the project type value is currently a non-maven project
      angular.forEach(["buildSystem", "finalName", "stack", "topLevelPackage", "version"], (propertyName) => {
        var property = properties[propertyName];
        if (property) {
          property.isMavenProjectType = isMavenProjectType;

          property['control-group-attributes'] = {
            //'ng-hide': "entity.type == 'Go'"
            'ng-hide': "isMavenProjectType(entity.type)"
          };
        }
      });

    } else if (commandId === "devops-edit") {
      var pipeline = properties.pipeline;
      if (pipeline) {
        pipeline.formTemplate = $templateCache.get("devOpsPipelineChooser.html");
      }
    } else if (commandId === "camel-edit-endpoint" || commandId === "camel-edit-endpoint-xml") {
      var endpoints = properties.endpoints;
      if (endpoints) {
        // remove the first dummy select value
        var values = endpoints.enum;
        if (values) {
          endpoints.enum = _.drop(values);
        }

        endpoints.selectors = {
          'select': (select) => {
            select.attr({size: '15'});
          }
        };
      }
    } else if (commandId === "camel-add-endpoint") {
      configureCamelComponentName(properties, $templateCache);

      var current = entity.componentName;
      if (angular.isString(current)) {
        // lets hide some fields
        angular.forEach(["componentNameFilter", "componentName"], (propertyName) => {
          var property = properties[propertyName];
          if (property) {
            property.hidden = true;
          }
        })
      }
    } else if (commandId === "camel-add-endpoint-xml") {
      configureCamelComponentName(properties, $templateCache);


      // lets hide some fields
      angular.forEach(["xml", "node"], (propertyName) => {
        var property = properties[propertyName];
        if (property && entity[propertyName]) {
          property.hidden = true;
        }
      });
    } else if (commandId === "camel-edit-node-xml") {
      var componentNameProperty = properties.componentName || {};
/*
      convertToStringArray(componentNameProperty.enum, "label");
*/

      componentNameProperty.formTemplate = $templateCache.get("camelComponentChooser.html");


      // lets hide some fields
      angular.forEach(["xml", "node"], (propertyName) => {
        var property = properties[propertyName];
        if (property && entity[propertyName]) {
          property.hidden = true;
        }
      });
    } else if (commandId.startsWith("camel-")) {
      configureCamelComponentName(properties, $templateCache);
    }
  }


  function configureCamelComponentName(properties, $templateCache) {
    var componentNameProperty = properties.componentName || {};
    componentNameProperty.formTemplate = $templateCache.get("camelComponentChooser.html");
    componentNameProperty.title = "Component";
  }

  function convertToStringArray(array, propertyName = "value") {
    if (angular.isArray(array)) {
      for (var i = 0, size = array.length; i < size; i++) {
        var value = array[i];
        if (!angular.isString(value) && angular.isObject(value)) {
          var textValue = value[propertyName];
          if (textValue) {
            array[i] = textValue;
          }
        }
      }
    }
  }
}
