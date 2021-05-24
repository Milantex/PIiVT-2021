import ITokenData from '../../src/components/auth/dto/ITokenData.interface';

declare global {
    namespace Express {
        interface Request {
            authorized?: ITokenData | null;
        }
    }
}
