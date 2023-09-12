class Command {
    action: string;
    key: string;
    
    constructor(action: string, key: string) {
        this.action = action;
        this.key = key;
    }
}

export default Command;