class Command {
    constructor(action, key) {
        this.action = action;
        this.key = key;
    }

    get obj() {
        return {
            action: this.action,
            key: this.key
        };
    }
}

export default Command;