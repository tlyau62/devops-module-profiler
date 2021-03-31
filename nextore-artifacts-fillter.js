// ==UserScript==
// @name         Nextore artifacts filler
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  from Tsz Lam
// @author       Tsz Lam
// @match        https://nexifyhk.visualstudio.com/NexToreV3/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @require      https://cdn.bootcss.com/jquery/3.4.1/jquery.min.js
// @require      https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js
// @grant        none
// ==/UserScript==

jQuery.noConflict();

(function ($) {
  "use strict";

  const saver = (function () {
    let artifacts = [];

    const artifactList = () =>
      $(
        ".release-summary-node-artifacts-list .release-summary-node-artifact-view"
      ).toArray();

    const mapArtifacts = (el) => ({
      artifact: $(el),
      alias() {
        return this.artifact.find(
          ".release-summary-node-artifact-alias-text .release-summary-node-text-element"
        )[0].childNodes[0].nodeValue;
      },
      version() {
        return this.artifact
          .find(".release-summary-node-artifact-version-text a")
          .text();
      },
      branch() {
        return this.artifact.find(
          ".release-summary-node-artifact-branch-section .release-summary-node-text-element"
        )[0].childNodes[0].nodeValue;
      },
    });

    const extractArtifacts = () => artifactList().map(mapArtifacts);

    const saveArtifacts = () => (artifacts = extractArtifacts());

    return {
      saveArtifacts,
      artifacts: () => artifacts,
    };
  })();

  const loader = (function () {
    const artifactFiller = () =>
      $(".ms-List-surface:first .ms-List-page > [role=presentation]")
        .toArray()
        .map((artifact) => ({
          alias: $(artifact).find(".flat-view-text-preserve").text(),
          tfsEnhancements: $(artifact).find('.combo[id^="vss_"]').data()
            .tfsEnhancements,
          option() {
            return this.tfsEnhancements[0];
          },
          dataSource() {
            return this.option()._behavior._dataSource._source;
          },
          dataSourceDetails() {
            return this.dataSource()
              .map((dataSource) => ({
                dataSource,
                parts: dataSource.split("_"),
              }))
              .map((dataSource) => ({
                dataSource: dataSource.dataSource,
                version: dataSource.parts[2],
                alias: dataSource.parts[0],
                branch: dataSource.parts[1],
              }));
          },
          input() {
            return $(this.option()._input);
          },
          setInput(val) {
            this.input().val(val);
            this.input().trigger("change");
          },
        }));

    const fillVersions = (versionFinder) =>
      artifactFiller().forEach((artifactControl) =>
        artifactControl.setInput(
          versionFinder(artifactControl, saver.artifacts())
        )
      );

    const findLastVersion = (artifactControl, artifacts) =>
      artifactControl.setInput(
        artifacts.find((artifact) => artifact.alias() === artifactControl.alias)
      );

    return {
      fillLastVersions: () => fillVersions(findLastVersion),
    };
  })();

  window.nextoreArtifacts = {
    saver,
    loader,
  };

  console.log("Keep smile");
})($);
