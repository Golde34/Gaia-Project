package auth.authentication_service.infrastructure.security;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.spec.OAEPParameterSpec;
import javax.crypto.spec.PSource;
import java.io.UnsupportedEncodingException;
import java.security.*;
import java.security.spec.MGF1ParameterSpec;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

public class RSATokenGenerate {

    private static void generateKeyPair() throws NoSuchAlgorithmException, NoSuchPaddingException, UnsupportedEncodingException, InvalidAlgorithmParameterException, InvalidKeyException, IllegalBlockSizeException, BadPaddingException {
        String token = "auth_service::Golde34::1";

        KeyPairGenerator keyPairGen = KeyPairGenerator.getInstance("RSA");
        keyPairGen.initialize(2048);
        KeyPair keyPair = keyPairGen.generateKeyPair();
        PublicKey publicKey = keyPair.getPublic();
        PrivateKey privateKey = keyPair.getPrivate();

        String publicKeyString = Base64.getEncoder().encodeToString(publicKey.getEncoded());
        String privateKeyString = Base64.getEncoder().encodeToString(privateKey.getEncoded());
        System.out.println(publicKeyString);
        System.out.println(privateKeyString);

        Cipher encryptCipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding");
        OAEPParameterSpec oaepParams = new OAEPParameterSpec("SHA-256", "MGF1", MGF1ParameterSpec.SHA256, PSource.PSpecified.DEFAULT);
        encryptCipher.init(Cipher.ENCRYPT_MODE, publicKey, oaepParams);
        byte[] encryptedBytes = encryptCipher.doFinal(token.getBytes("UTF-8"));
        String encryptedToken = Base64.getEncoder().encodeToString(encryptedBytes);

        System.out.println("Encrypted Token: " + encryptedToken);

        Cipher decryptCipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding");
        decryptCipher.init(Cipher.DECRYPT_MODE, privateKey, oaepParams);
        byte[] decryptedBytes = decryptCipher.doFinal(Base64.getDecoder().decode(encryptedToken));
        System.out.println(new String(decryptedBytes, "UTF-8"));
    }

    public static void main(String[] args) throws Exception {
        generateKeyPair();
        
        String PUBLIC_KEY_STRING = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCkFDBJGOSJg38OxsEbEV81DfQ5eySDQiggsMzIkKL7rxLJtvkSovJkJGaFPlqSU5s71r1+PoOY6KmwikCrnrB0LbdaDCtYwNuOp+AU/NfdUzpmfd9Iy3JC5KDJ8q/adlChM0tFwamepNzjrHb2oRnqRKABgSWDFKSl93bCCq0pPQIDAQAB";
        String PRIVATE_KEY_STRING = "MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAKQUMEkY5ImDfw7GwRsRXzUN9Dl7JINCKCCwzMiQovuvEsm2+RKi8mQkZoU+WpJTmzvWvX4+g5joqbCKQKuesHQtt1oMK1jA246n4BT8191TOmZ930jLckLkoMnyr9p2UKEzS0XBqZ6k3OOsdvahGepEoAGBJYMUpKX3dsIKrSk9AgMBAAECgYAHiOeFCGScCSm11LecCCzoqmDzeRbsTU/f3QMxTq1YzcT0Y9w8j0kQ3sp8vV8Dr8rqcUWlAckPSmo2MaVooL/x4JL3nA0I/DlbXlzscfoWzGMI6c1Bcb2mZngYXVqMmhxNdcreV+Y94LpFqXdH+H3vck8z+q3tNvgiLGNHsHl+zQJBALJGTZJC99gZosi6MVYqWiiA6lD6J7/Yvy2sJNilLeuozoLI7bgdx9d0rkWIFv9zcGuWvI6PgvFVxD+yTcd6HE8CQQDrnXWyP7vtgQeKZsV5hnOb0pCg4X/EpmU9fl/V1E+fReFcVKRVUrh/pc8VK0qJg0o0VmVdv2kQimN9fFbgUUKzAkBBrUTGrYVBR7CA4pdqdw/f/B5W1tHuC5vi55hrd+8C8p2h8QQi4FXPOl05oHlYgt7XxCCTJKvI3R//l2CwLHxhAkEAqerZeV4LSmH2LTKmkViMQUDeepeFTC1v76QWux+s+EEuICcOiFXqpmvOZwbcb0VWm13/JlenDn2u+E1WXdlcjwJAE0/Bf+5VOcJXYlyJg0SUt5qemArQjynOXQjMdrbO54avw+7792YGW0JG6plVfiZ2J3lQrDPsnAzpCrmLOKbHJA==";
        String token = "auth_service::Golde34::1";

        // Bước 1: Tạo cặp khóa RSA
        byte[] publicKeyBytes = Base64.getDecoder().decode(PUBLIC_KEY_STRING);
        X509EncodedKeySpec keySpec = new X509EncodedKeySpec(publicKeyBytes);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        PublicKey publicKey = keyFactory.generatePublic(keySpec);

        // Mã hóa dữ liệu bằng public key với OAEP padding
        Cipher encryptCipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding");
        OAEPParameterSpec oaepParams = new OAEPParameterSpec("SHA-256", "MGF1", MGF1ParameterSpec.SHA256, PSource.PSpecified.DEFAULT);
        encryptCipher.init(Cipher.ENCRYPT_MODE, publicKey, oaepParams);
        byte[] encryptedBytes = encryptCipher.doFinal(token.getBytes("UTF-8"));
        String encryptedToken = Base64.getEncoder().encodeToString(encryptedBytes);

        System.out.println("Encrypted Token: " + encryptedToken);

        // Bước 3: Giải mã dữ liệu bằng private key
        byte[] privateKeyBytes = Base64.getDecoder().decode(PRIVATE_KEY_STRING);
        PKCS8EncodedKeySpec priKeySpec = new PKCS8EncodedKeySpec(privateKeyBytes);
        PrivateKey privateKey = keyFactory.generatePrivate(priKeySpec);

        // Bước 2: Giải mã dữ liệu bằng private key với OAEP padding
        Cipher decryptCipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding");
        decryptCipher.init(Cipher.DECRYPT_MODE, privateKey, oaepParams);
        byte[] decryptedBytes = decryptCipher.doFinal(Base64.getDecoder().decode(encryptedToken));
        System.out.println(new String(decryptedBytes, "UTF-8"));
    }
}
