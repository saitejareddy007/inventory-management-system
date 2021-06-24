let instance;

class InventoryAPIs {
    static getInstance() {
        if (!instance) {
            instance = new InventoryAPIs();
        }
        return instance;
    }
}

exports.getInstance = InventoryAPIs.getInstance;
