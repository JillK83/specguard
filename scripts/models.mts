import { createZooworkClient } from '@zoowork-ai/sdk'

const zc = createZooworkClient()
const models = await zc.listModels()

for (const m of models) {
  const selectable = m.selectable === false ? ' [not selectable]' : ''
  const thinking = m.thinking ? ` thinking:${m.thinking.levels.join(',')}` : ''
  const lifecycle = m.lifecycle_status ? ` status:${m.lifecycle_status}` : ''
  console.log(`${m.model}${selectable}${lifecycle}${thinking}`)
}
