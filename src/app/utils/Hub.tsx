export const HubType = {
  AuthTokenChanged: 0,
  LanguageChanged: 1,
  UserChanged: 2,
  MemberAdded: 3,
} as const;

export type HubType = typeof HubType[keyof typeof HubType];

import { useEffect, useLayoutEffect, useRef } from "react";
import { v4 as uuid } from "uuid";

export default class Hub {
  static list: Map<String, Function>[] = [];

  static getListeners = (type: HubType): Map<String, Function> => {
    if (!Hub.list[type]) {
      Hub.list[type] = new Map<String, Function>();
    }
    return Hub.list[type];
  };

  static dispatch = (type: HubType, data?: any): boolean => {
    let hasListeners = false;

    for (let fnc of Hub.getListeners(type).values()) {
      fnc(data);
      hasListeners = true;
    }

    return hasListeners;
  };

  static subscribe = (type: HubType, fnc: Function) => {
    const id = uuid();
    Hub.getListeners(type).set(id, fnc);
    return id;
  };

  static unsubscribe = (type: HubType, id: String) => {
    Hub.getListeners(type).delete(id);
  };

  static on = (types: HubType[], fnc: Function): any => {
    const list = types.map((type) => ({ id: this.subscribe(type, fnc), type }));
    return () => list.forEach((x) => this.unsubscribe(x.type, x.id));
  };
}

export function useHub(
  types: HubType | HubType[],
  fnc: Function,
  runOnComponentDidMount?: boolean
): void {
  const fncRef = useRef(fnc);
  useLayoutEffect(() => {
    fncRef.current = fnc;
  });

  useEffect(() => {
    runOnComponentDidMount && fncRef.current();
    return Hub.on(Array.isArray(types) ? types : [types], (data: any) =>
      fncRef.current(data)
    );
  }, []);
}
