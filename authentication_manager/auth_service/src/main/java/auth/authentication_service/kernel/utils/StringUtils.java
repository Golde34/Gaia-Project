package auth.authentication_service.kernel.utils;

public class StringUtils {

    public static String EMPTY = "";

    public static boolean isBlank(String str) {
        return str == null || str.trim().isEmpty();
    }

   public static String[] split(String str, String delimiter) {
        return str.split(delimiter);
   }
}
