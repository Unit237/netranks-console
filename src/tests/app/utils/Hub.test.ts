import Hub from "../../../app/utils/Hub";

describe("Hub", () => {
  beforeEach(() => {
    // Reset Hub state before each test
    Hub.list = [];
  });

  describe("subscribe and unsubscribe", () => {
    it("should subscribe a listener and return an id", () => {
      const listener = jest.fn();
      const id = Hub.subscribe("test" as any, listener);

      expect(id).toBeDefined();
      expect(typeof id).toBe("string");
    });

    it("should unsubscribe a listener", () => {
      const listener = jest.fn();
      const id = Hub.subscribe("test" as any, listener);

      Hub.unsubscribe("test" as any, id);

      Hub.dispatch("test" as any);
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe("dispatch", () => {
    it("should dispatch to all subscribed listeners", () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      Hub.subscribe("test" as any, listener1);
      Hub.subscribe("test" as any, listener2);

      const data = { test: "data" };
      Hub.dispatch("test" as any, data);

      expect(listener1).toHaveBeenCalledWith(data);
      expect(listener2).toHaveBeenCalledWith(data);
    });

    it("should return true if listeners exist", () => {
      Hub.subscribe("test" as any, jest.fn());
      const result = Hub.dispatch("test" as any);

      expect(result).toBe(true);
    });

    it("should return false if no listeners exist", () => {
      const result = Hub.dispatch("test" as any);

      expect(result).toBe(false);
    });
  });

  describe("on", () => {
    it("should subscribe to multiple types and return unsubscribe function", () => {
      const listener = jest.fn();
      const unsubscribe = Hub.on(["type1", "type2"] as any, listener);

      Hub.dispatch("type1" as any);
      expect(listener).toHaveBeenCalledTimes(1);

      Hub.dispatch("type2" as any);
      expect(listener).toHaveBeenCalledTimes(2);

      unsubscribe();

      Hub.dispatch("type1" as any);
      Hub.dispatch("type2" as any);
      expect(listener).toHaveBeenCalledTimes(2); // No new calls
    });
  });

  describe("getListeners", () => {
    it("should create a new map if one does not exist", () => {
      const listeners = Hub.getListeners("newType" as any);

      expect(listeners).toBeInstanceOf(Map);
    });

    it("should return the same map for the same type", () => {
      const listeners1 = Hub.getListeners("test" as any);
      const listeners2 = Hub.getListeners("test" as any);

      expect(listeners1).toBe(listeners2);
    });
  });
});
