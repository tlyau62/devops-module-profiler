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

const mapping = {
  "BD-EPS-Frontend": "",
  ECMCommon: "NexTore.ECM.Common",
  ECMECF: "NexTore.ECM.ECF",
  ECMeCounter: "NexTore.ECM.eCounter",
  ECMeDirectory: "NexTore.ECM.eDirectory",
  ECMPlanViewer: "NexTore.ECM.PlanViewer",
  EPSeProcessing: "NexTore.EPS.eProcessing",
  ESHRegistration: "NexTore.ESH.Registration",
  ESSeCounter: "NexTore.ESS.eCounter",
  FormToPdf: "",
  NexToreV3Repo: "",
  "Viewer.Pas": "NexTore.Viewer.Pas",
};

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
      latestVersion() {
        const map = mapping[this.alias];
        const dataSource = this.dataSourceDetails();
        const target = dataSource.find((d) => d.alias === map) || dataSource[0];

        return target.dataSource;
      },
      setVersion() {
        this.setInput(this.latestVersion());
      },
      loadVersion() {
        const targetArtifact = artifacts.find(
          (artifact) => artifact.alias() === this.alias
        );

        this.setInput(targetArtifact.version());
      },
    }));

window.filler = () =>
  artifactFiller().forEach((artifact) => artifact.setVersion());

window.fillerCurrentVersion = () =>
  artifactFiller().forEach((artifact) => artifact.loadVersion());

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

window.saveArtifacts = () => (window.artifacts = extractArtifacts());

console.log("Keep smile");
