import { getPublicEnv } from '../../env';

export function PrintEnv() {
  return <div id="__NEXT_PUBLIC_ENV__">{JSON.stringify(getPublicEnv())}</div>;
}
