import { readSeedStore, readStore, reseedRuntimeStore, writeStore } from '@/lib/server/store';
import type {
  PersistenceGateway,
  PersistenceWriteContext,
} from '@/lib/server/persistence/contracts';
import { buildReadContext } from '@/lib/server/persistence/context';

export class JsonRuntimePersistenceGateway implements PersistenceGateway {
  async readSeed() {
    return readSeedStore();
  }

  async reseedRuntime() {
    await reseedRuntimeStore();
  }

  async read() {
    const data = await readStore();
    return buildReadContext(data);
  }

  async write(mutator: (context: PersistenceWriteContext) => Promise<void> | void) {
    const data = await readStore();
    let committed = false;

    const context: PersistenceWriteContext = {
      ...buildReadContext(data),
      commit: async () => {
        await writeStore(data);
        committed = true;
      },
    };

    await mutator(context);

    if (!committed) {
      await writeStore(data);
    }
  }
}
