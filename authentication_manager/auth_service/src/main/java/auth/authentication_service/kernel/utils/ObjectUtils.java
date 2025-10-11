package auth.authentication_service.kernel.utils;

import java.util.Objects;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ObjectUtils {
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public boolean isNullOrEmpty(String str) {
        return str == null || str.isEmpty();
    }

    public boolean isNullOrEmpty(Object obj) {
        return Objects.isNull(obj);
    }

    public boolean isMatchingObject(Object obj1, Object obj2) {
        return Objects.equals(obj1, obj2);
    }

    public boolean isMatchingString(String str1, String str2) {
        return str1.equals(str2);
    }

    public boolean isMatchingEncoderString(String str1, String str2) {
        return passwordEncoder.matches(str1, str2);
    }
}
