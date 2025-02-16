package ct.contribution_tracker.kernel.utils;

import java.security.SecureRandom;

public class ULID {

    private final static SecureRandom random = new SecureRandom();

    public static String nextULID() {
        long timestamp = System.currentTimeMillis();
        byte[] randomBytes = new byte[10];  // 80 bits
        random.nextBytes(randomBytes);

        return formatULID(timestamp, randomBytes);
    }

    private static String formatULID(long timestamp, byte[] randomBytes) {
        String timestampPart = Long.toString(timestamp, 32);
        String randomPart = bytesToHex(randomBytes);

        // Padding the timestamp part to fill 10 characters (40 bits)
        while (timestampPart.length() < 10) {
            timestampPart = "0" + timestampPart;
        }

        return timestampPart + randomPart;
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder hexBuilder = new StringBuilder();
        for (byte b : bytes) {
            hexBuilder.append(String.format("%02x", b));
        }
        return hexBuilder.toString();
    }

}

