export class Utils {
    static generateColorFromId(id) {
        // Simple hash function to generate colors
        const hue = (id * 137) % 360;
        return {
            hue: hue,
            saturation: 0.6,
            brightness: 0.9
        };
    }
}
