export class Utils {
    static generateRectColorFromId(id) {
        const hue = (id*10) % 360;
        return {
            hue: hue,
            saturation: 0.2,
            brightness: 0.9
        };
    }

    static generateDivColorFromId(id) {
        const hue = (id*10 + 180) % 360;
        return {
            hue: hue,
            saturation: 1,
            brightness: 0.7
        };
    }

}
