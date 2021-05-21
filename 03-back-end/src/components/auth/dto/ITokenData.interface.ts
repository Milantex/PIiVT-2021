export default interface ITokenData {
    role: "user" | "administrator";
    id: number;
    identity: string;
}
