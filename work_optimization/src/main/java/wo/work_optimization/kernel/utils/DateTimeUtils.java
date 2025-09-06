package wo.work_optimization.kernel.utils;

import lombok.experimental.UtilityClass;

import java.text.ParseException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

import io.micrometer.common.util.StringUtils;

@UtilityClass
public class DateTimeUtils {
    private static final String DEFAULT_DATETIME_PATTERN = "dd/MM/yyyy HH:mm:ss";
    public static final String YY_MM_DD = "yyMMdd";
    private static final String DEFAULT_DASH_DATETIME_PATTERN = "yyyy-MM-dd HH:mm:ss";

    public static String currentDateTime() {
        return LocalDateTime.now().format(DateTimeFormatter.ofPattern(DEFAULT_DATETIME_PATTERN));
    }

    public static String currentDateTimeDash() {
        return LocalDateTime.now().format(DateTimeFormatter.ofPattern(DEFAULT_DASH_DATETIME_PATTERN));
    }

    public static String currentDateTime(String pattern) {
        if (StringUtils.isBlank(pattern)) {
            return currentDateTime();
        }
        return LocalDateTime.now().format(DateTimeFormatter.ofPattern(pattern));
    }

    public static String currentDateTime(DateTimeFormatter dateTimeFormatter) {

        return LocalDateTime.now().format(dateTimeFormatter);
    }

    public static String getStringFormat(String pattern, LocalDateTime date) {
        if (date == null) {
            return null;
        }
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
        return formatter.format(date);
    }

    public static String currentDateTimeYYMMDD() {
        return LocalDateTime.now().format(DateTimeFormatter.ofPattern(YY_MM_DD));
    }

    public static long convertStringDateTime(String dateTime) throws ParseException {
        Instant instant = Instant.parse(dateTime);
        return instant.toEpochMilli();
    }

    public static LocalDateTime convertLongToLocalDateTime(long time) {
        return Instant.ofEpochMilli(time).atZone(ZoneId.systemDefault()).toLocalDateTime();
    }
}
