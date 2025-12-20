import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.spec.OAEPParameterSpec;
import javax.crypto.spec.PSource;
import java.io.UnsupportedEncodingException;
import java.math.BigInteger;
import java.security.*;
import java.security.interfaces.RSAPrivateCrtKey;
import java.security.spec.*;
import java.util.Base64;

public class RSATokenGenerate {

    /**
     * Extract public key từ private key
     * Chú ý: Private key phải ở định dạng PKCS#8 và chứa CRT (Chinese Remainder Theorem) parameters
     */
    private static PublicKey extractPublicKeyFromPrivateKey(String privateKeyString) throws Exception {
        // Decode private key
        byte[] privateKeyBytes = Base64.getDecoder().decode(privateKeyString);
        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(privateKeyBytes);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        PrivateKey privateKey = keyFactory.generatePrivate(keySpec);

        // Cast to RSAPrivateCrtKey để lấy public key parameters
        if (privateKey instanceof RSAPrivateCrtKey) {
            RSAPrivateCrtKey privKey = (RSAPrivateCrtKey) privateKey;
            
            // Lấy modulus và public exponent từ private key
            BigInteger modulus = privKey.getModulus();
            BigInteger publicExponent = privKey.getPublicExponent();
            
            // Tạo public key từ modulus và public exponent
            RSAPublicKeySpec publicKeySpec = new RSAPublicKeySpec(modulus, publicExponent);
            PublicKey publicKey = keyFactory.generatePublic(publicKeySpec);
            
            return publicKey;
        } else {
            throw new IllegalArgumentException("Private key không chứa CRT parameters, không thể extract public key");
        }
    }

    private void generateKeyPaỉr() throws NoSuchAlgorithmException, NoSuchPaddingException, UnsupportedEncodingException, InvalidAlgorithmParameterException, InvalidKeyException, IllegalBlockSizeException, BadPaddingException {
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
//        String PUBLIC_KEY_STRING = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAotsNTm2fBw4RoHVmMmhAS3pGgYhTqUXlSJU6/WnUVxQAuNJBn2DLfEPAGAjVKfq7scFDE+v13kVr6IAFlCxY41J44VJ+Z/0057E7Wv4hwCgK8kgkuIx6fv6aV1fk9Ru95kOkQ543RKsjP6OHZ4fYf2/s0kYOSOHXiMFbVTr5p0kcoHQa/Z+o4Wix5xZNGM7BYDURgS7rybcqdHBmF0WHSwq640/jNwMB6cQE010B6oYc+uDl1TnqRyUBtLao+m+v3vFKwTmAuT+8ggiOus8IT4MIRXK9xG5nYmxC3LQVfLYZZWkqFXeOl+quH16WuABUx3Au1XK5uMBIeu2929kldwIDAQAB";
//        String PRIVATE_KEY_STRING = "MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCi2w1ObZ8HDhGgdWYyaEBLekaBiFOpReVIlTr9adRXFAC40kGfYMt8Q8AYCNUp+ruxwUMT6/XeRWvogAWULFjjUnjhUn5n/TTnsTta/iHAKArySCS4jHp+/ppXV+T1G73mQ6RDnjdEqyM/o4dnh9h/b+zSRg5I4deIwVtVOvmnSRygdBr9n6jhaLHnFk0YzsFgNRGBLuvJtyp0cGYXRYdLCrrjT+M3AwHpxATTXQHqhhz64OXVOepHJQG0tqj6b6/e8UrBOYC5P7yCCI66zwhPgwhFcr3EbmdibELctBV8thllaSoVd46X6q4fXpa4AFTHcC7Vcrm4wEh67b3b2SV3AgMBAAECggEADZtRxEttGGYjhjg+NANOg+qRI4IkGKY0tFjLl0q//rqMHjprAzRPgXAZB6kNQ7b69wIXvFK1temE95BivEZBnan8BuTL7PJUo5saQ3hXkjow7UdRJ3ONSeO0j4xSHpc/yZJokhcRCmq7b4tr5R7jhtpE0NjLmWlNMdQ98PlpdywxdWewCsH2MgZR47TTExYTiwMRkf0T6vx6ViUkrU02JtM6Y6e8EqsVxp11pKZoLtDQ2hIZWxrXB7vUJw673HwsnRluml/MD0hCkw/A/TxSEGJD6XaVL2tltOGwGurZbjIkX6Xp68Rs0aSwPF3InONWc8BRcT5KnLz1lbcSWk87WQKBgQDYyOJd53gRCOXt8FCH1BArDys7m5+yU3skfaJnoFXplXtV78yPY5ke5Z3UHlfLS0Fe6iORtnwuHGgFwVAXZ59A5Fh0KYUrrwhtbLl8j9DpoOwTYRpmAfjfowfKM7VD6DkBHj1E6ll1Q3H07jx0o9hLJyun5yiqSQxcbJv0sieo8wKBgQDAUMKO69P8lP3yO18c3vUqGLBbB2yxyJ/q+XZzawT17dkE6XCbqk+bV+cYAE4HtB6/lRUAGL9pa3My49pgvP+qD54qlZjyO6ZCQhEPORjtE3c6qLp2DhO78PpsEjCv5pMSrXO6E+WMSmlk8RTvMkhjzpwlvNp4JP9BkMZCF95ybQKBgB0b3El/qz+eUkGA409ZylH913BJlUf8raxYslX30ZFr4QPJD06xsP3VFzxEVsWVdVGpXt1SA5qtdcpQCtEZuOidwMLYUGltN1R6JO304bh9QzXW9BR+b0yYN5OPHefgZscfqFp4nUqBo+ufkb6XwZNVzybcgzlaVa6TZt2Ujn7BAoGBAKo/lEzzxoGG4FytZKDpW739hzm+k+G7Cp74Yn0Ak66m9YTcp1yW48xQf/sGYg19ze6qKqIgRmsrvRqjDXKwPeCt3MY0Eub2GVP0qqeAU2mk3trl/dN+2Md7KCW94K4Hf9F8DcP/0yljwnOi3HZ4XA9HG4Jo8jqD/hhr8qcV/E3tAoGAENAXp1Ib81Tlq11VxXSEWHnPWEqiCAXJHMXhdiN9Gw8OqHrMaAYXYfBtk7yn0EwNraZ9k6mI3MTob84SvFntnrLUh0l2WPy2Ib7lbZP7mMp+ZiGEHD2Bu6VO2JG+xUgPF4n2fTv5OGyB9zjDObHw6yJSW3pfMDTA1hexM2m9TV4=";
        String token = "auth_service::Golde34::1";

        // Demo: Extract public key từ private key
//        System.out.println("=== EXTRACT PUBLIC KEY FROM PRIVATE KEY ===");
//        PublicKey extractedPublicKey = extractPublicKeyFromPrivateKey(PRIVATE_KEY_STRING);
//        String extractedPublicKeyString = Base64.getEncoder().encodeToString(extractedPublicKey.getEncoded());
//        System.out.println("Extracted Public Key: " + extractedPublicKeyString);
//        System.out.println("Original Public Key:  " + PUBLIC_KEY_STRING);
//        System.out.println("Keys match: " + extractedPublicKeyString.equals(PUBLIC_KEY_STRING));
//        System.out.println();

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
