/**
 * Copyright 2023 Open Logistics Foundation
 *
 * Licensed under the Open Logistics License 1.0.
 * For details on the licensing terms, see the LICENSE file.
 */

const readline = require("readline");

const Container = artifacts.require("Container");
const Segment = artifacts.require("Segment");

const CONTAINER_NAME = "Container A";
const SEGMENT_NAME_A = "Segment A";
const SEGMENT_NAME_B = "Segment B";

async function deployContainer(deployer, alice) {
  console.log(`\n\n############################`);
  console.log(`### Deploy '${CONTAINER_NAME}' ###`);
  console.log(`############################\n`);

  await deployer.deploy(Container, alice, CONTAINER_NAME);
  const container = await Container.deployed();
  console.log(`-> deployer.deploy(ContainerContract, ${alice}, ${CONTAINER_NAME})\n`);

  const address = await container.address;
  console.log(`container.address: ${address}\n`);

  const name = await container.getName();
  console.log(`container.getName(): ${name}\n`);

  const segmentCount = (await container.getSegmentCount()).toString();
  console.log(`container.getSegmentCount(): ${segmentCount}\n`);
  return container;
}

async function addNewSegmentToContainer(container) {
  console.log(`\n\n############################################`);
  console.log(`### Add new '${SEGMENT_NAME_A}' to '${CONTAINER_NAME}' ###`);
  console.log(`############################################\n`);

  await container.addNewSegment(SEGMENT_NAME_A);
  console.log(`-> container.addNewSegment(${SEGMENT_NAME_A})\n`);

  const segmentAddress = await container.getSegmentAtIndex(0);
  const segment = await Segment.at(segmentAddress);

  const segmentCount = (await container.getSegmentCount()).toString();
  console.log(`container.getSegmentCount(): ${segmentCount}\n`);

  const segmentAtIndex = await container.getSegmentAtIndex(0);
  console.log(`container.segmentAtIndex(0): ${segmentAtIndex}\n`);

  const segmentInContainer = await container.isSegmentInContainer(segment.address);
  console.log(`container.isSegmentInContainer: ${segmentInContainer}\n`);

  const containerAddress = await segment.getContainer();
  console.log(`segment.getContainer(): ${containerAddress}`);
  console.log(`container.address:      ${container.address}\n`);
}

async function deploySegment(deployer, alice, container) {
  console.log(`\n\n##########################`);
  console.log(`### Deploy '${SEGMENT_NAME_B}' ###`);
  console.log(`##########################\n`);

  await deployer.deploy(Segment, alice, SEGMENT_NAME_B, container.address);
  const segment = await Segment.deployed();
  console.log(`-> deployer.deploy(SegmentContract, ${alice}, ${SEGMENT_NAME_B}, ${container.address})\n`);

  const segmentAddress = await segment.address;
  console.log(`segment.address: ${segmentAddress}\n`);

  const name = await segment.getName();
  console.log(`segment.getName(): ${name}\n`);

  const containerAddress = await segment.getContainer();
  console.log(`segment.getContainer(): ${containerAddress}\n`);
  return segment;
}

async function addSegmentToContainer(segment, container) {
  console.log(`\n\n########################################`);
  console.log(`### Add '${SEGMENT_NAME_B}' to '${CONTAINER_NAME}' ###`);
  console.log(`########################################\n`);

  await container.addSegment(segment.address);
  console.log(`-> container.addSegment(${segment.address})\n`);

  const segmentCount = (await container.getSegmentCount()).toString();
  console.log(`container.getSegmentCount(): ${segmentCount}\n`);

  const segmentAtIndex = await container.getSegmentAtIndex(1);
  console.log(`container.segmentAtIndex(1): ${segmentAtIndex}\n`);

  const segmentInContainer = await container.isSegmentInContainer(segment.address);
  console.log(`container.isSegmentInContainer(${segment.address}): ${segmentInContainer}\n`);

  const containerAddress = await segment.getContainer();
  console.log(`segment.getContainer(): ${containerAddress}`);
  console.log(`container.address:      ${container.address}\n`);
}

async function removeSegment(container, name, index) {
  console.log(`\n\n#############################################`);
  console.log(`### Remove '${name}' from '${CONTAINER_NAME}' ###`);
  console.log(`#############################################\n`);

  const segmentAtIndex = await container.getSegmentAtIndex(index);

  await container.removeSegmentAtIndex(index);
  console.log(`-> container.removeSegmentAtIndex(${index})\n`);

  const segmentCount = (await container.getSegmentCount()).toString();
  console.log(`container.segmentCount(): ${segmentCount}\n`);

  const segmentInContainer = await container.isSegmentInContainer(segmentAtIndex);
  console.log(`container.segmentInContainer(${segmentAtIndex}): ${segmentInContainer}`);

  if (index === 1) {
    const remainingSegmentIndex = index - 1;
    const remainingSegmentAtIndex = await container.getSegmentAtIndex(remainingSegmentIndex);
    const remainingSegmentInContainer = await container.isSegmentInContainer(remainingSegmentAtIndex);
    console.log(`container.segmentInContainer(${remainingSegmentAtIndex}): ${remainingSegmentInContainer}\n`);
  }
}

module.exports = async function (deployer, network, accounts) {
  if (network === "local") {
    console.log("\n\n#######################");
    console.log("### START OF SCRIPT ###");
    console.log("#######################\n");

    console.log("ACTIONS");
    console.log("1. Deploy Container");
    console.log("2. Add new Segment");
    console.log("3. Deploy Segment");
    console.log("4. Add existing Segment");
    console.log("5. Remove second segment");
    console.log("6. Remove first segment\n");
    await promptUser();

    const container = await deployContainer(deployer, accounts[0]);
    await promptUser();

    await addNewSegmentToContainer(container);
    await promptUser();

    const segment = await deploySegment(deployer, accounts[0], container);
    await promptUser();

    await addSegmentToContainer(segment, container);
    await promptUser();

    await removeSegment(container, SEGMENT_NAME_B, 1);
    await promptUser();

    await removeSegment(container, SEGMENT_NAME_A, 0);
    await promptUser();

    // TODO-MP: add function for adding NFTs

    readlineInterface.close();
    console.log("\n\n#####################");
    console.log("### END OF SCRIPT ###");
    console.log("#####################\n\n\n");
  }
};

const readlineInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function promptUser() {
  return new Promise((resolve) => {
    readlineInterface.question("\nPress any key ...", () => resolve());
  });
}
