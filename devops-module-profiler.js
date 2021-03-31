// ==UserScript==
// @name         devops-module-profiler
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  from Tsz Lam
// @author       Tsz Lam
// @match        https://nexifyhk.visualstudio.com/NexToreV3/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @require      https://code.jquery.com/jquery-3.6.0.slim.min.js
// @grant        none
// @run-at       document-end
// ==/UserScript==

/**
 * jquery will be overwritten by ms devops default jquery after window.onload
 */
(function ($$) {
  "use strict";

  const saver = (function () {
    let artifacts = [];
    let releaseVer = "";

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

    const saveArtifacts = () => {
      artifacts = extractArtifacts();
      releaseVer = $(".internal-breadcrumb--item:last").text();
    };

    return {
      saveArtifacts,
      artifacts: () =>
        artifacts.map((artifact) => ({
          artifact: artifact.artifact,
          alias: artifact.alias(),
          version: artifact.version(),
          branch: artifact.branch(),
        })),
      releaseVer: () => releaseVer,
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
      artifacts.find((artifact) => artifact.alias === artifactControl.alias)
        .version;

    return {
      fillLastVersions: () => fillVersions(findLastVersion),
    };
  })();

  const $saveBtn = $$(
    "<button>save<span id='profiler-release'></span></button>"
  );
  const $loadBtn = $$("<button>load</button>");
  const $logBtn = $$("<button>log</button>");
  const $wrapper = $$(
    "<div id='profiler-wrapper'><h6>Module profiler</h6></div>"
  );
  const $wrapperStyle = $$(`
  <style>
    #profiler-wrapper {
      position: absolute;
      bottom: 0;
      right: 0;
      z-index: 9999999;
      background: white;
    }

    #profiler-wrapper h6 {
      margin: 0;
      text-align: center;
    }
  </style>`);

  $saveBtn.click(() => {
    saver.saveArtifacts();
    $$("#profiler-release").text(` (${saver.releaseVer()})`);
    alert(`${saver.artifacts().length} artifacts are saved.`);
  });
  $loadBtn.click(() => {
    if (saver.artifacts() === 0) {
      alert("No artifact is found");
    }
    loader.fillLastVersions();
  });
  $logBtn.click(() => console.log(saver.artifacts()));
  $wrapper.append($saveBtn);
  $wrapper.append($loadBtn);
  $wrapper.append($logBtn);
  $$(document.body).append($wrapper);
  $$(document.body).append($wrapperStyle);

  window.nextoreArtifacts = {
    saver,
    loader,
  };

  console.log("Keep smile");
})($.noConflict(true));
