export class Utils {
    static generateColorFromId(id) {
        // Simple hash function to generate colors
        const hue = (id*10) % 360;
        console.log(hue)
        return {
            hue: 196,
            saturation: 0.6,
            brightness: 0.9 + id/20.0
        };
    }
}
