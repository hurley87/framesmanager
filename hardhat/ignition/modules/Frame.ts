import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const FramesModule = buildModule('FramesModule', (m) => {
  const lock = m.contract('Frames', [
    '0xA8f3C4947599846971bdac93fE7077De25647816',
  ]);

  console.log('lock', lock);

  return { lock };
});

export default FramesModule;
