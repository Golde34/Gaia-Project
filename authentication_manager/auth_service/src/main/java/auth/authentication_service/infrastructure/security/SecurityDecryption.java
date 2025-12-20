package auth.authentication_service.infrastructure.security;

import auth.authentication_service.core.domain.entities.User;
import auth.authentication_service.core.domain.enums.ServiceEnum;
import auth.authentication_service.core.services.interfaces.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.util.Pair;
import org.springframework.stereotype.Service;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.spec.OAEPParameterSpec;
import javax.crypto.spec.PSource;
import java.io.UnsupportedEncodingException;
import java.security.*;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.MGF1ParameterSpec;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Base64;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class SecurityDecryption {

    @Value("${app.services.security.private-key}")
    private String privateKey;

    @Value("${app.services.security.service-token}")
    private String serviceToken;

    private final UserService userService;

    private static final String DELIMITER = "::";

    public String decrypt(String encryptedPlainText) throws NoSuchAlgorithmException, InvalidKeySpecException,
            InvalidAlgorithmParameterException, InvalidKeyException, NoSuchPaddingException,
            IllegalBlockSizeException, BadPaddingException, UnsupportedEncodingException {
        byte[] privateKeyBytes = Base64.getDecoder().decode(privateKey);
        PKCS8EncodedKeySpec priKeySpec = new PKCS8EncodedKeySpec(privateKeyBytes);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        PrivateKey privateKey = keyFactory.generatePrivate(priKeySpec);
        OAEPParameterSpec oaepParams = new OAEPParameterSpec("SHA-256", "MGF1", MGF1ParameterSpec.SHA256, PSource.PSpecified.DEFAULT);
        Cipher decryptCipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding");
        decryptCipher.init(Cipher.DECRYPT_MODE, privateKey, oaepParams);
        byte[] decryptedBytes = decryptCipher.doFinal(Base64.getDecoder().decode(encryptedPlainText));
        return new String(decryptedBytes, "UTF-8");
    }

    public boolean validateToken(String headerToken) {
        try {
            String comparedToken = ServiceEnum.AS.getServiceName() + "::" + headerToken + "::";
            String firstPartToken = sliceLastPart(headerToken).getFirst();
            String secondPartToken = sliceLastPart(headerToken).getSecond();
            if (comparedToken.equals(firstPartToken)) {
                return false;
            }

            User user = userService.getUserById(Long.valueOf(secondPartToken), "Filter Token Service");
            return !Objects.isNull(user);
        } catch (Exception e) {
            log.error("Error while validating token: " + e.getMessage());
            return false;
        }
    }

    private Pair<String, String> sliceLastPart(String headerToken) {
        if (headerToken == null || headerToken.isEmpty()) {
            throw new IllegalArgumentException("Input or delimiter cannot be null or empty");
        }

        String[] parts = headerToken.split(DELIMITER);
        if (parts.length < 3) {
            throw new IllegalArgumentException("Input string must contain at least two delimiters");
        }

        return Pair.of(parts[0] + DELIMITER + parts[1] + DELIMITER, parts[parts.length - 1]);
    }
}


