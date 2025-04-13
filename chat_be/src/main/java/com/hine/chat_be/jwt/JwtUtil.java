package com.hine.chat_be.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException; // Import cụ thể
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value; // Để đọc cấu hình
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    // Tiêm (Inject) giá trị cấu hình từ application.properties hoặc application.yml
    @Value("${jwt.secret}")
    private String jwtSecret; // Khóa bí mật đọc từ cấu hình

    @Value("${jwt.expiration.ms}")
    private long jwtExpirationMs; // Thời gian hết hạn (mili giây) đọc từ cấu hình

    private SecretKey cachedSigningKey; // Lưu cache đối tượng khóa

    /**
     * Tạo khóa ký từ chuỗi bí mật Base64 đã cấu hình.
     * Lưu cache kết quả để tăng hiệu quả.
     * @return Đối tượng SecretKey.
     */
    private SecretKey getSigningKey() {
        // Lưu cache đối tượng SecretKey vì việc tạo lại nó tốn kém
        if (cachedSigningKey == null) {
            byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
            this.cachedSigningKey = Keys.hmacShaKeyFor(keyBytes);
        }
        return cachedSigningKey;
    }

    /**
     * Trích xuất tên người dùng (subject) từ token JWT.
     * @param token Token JWT.
     * @return Tên người dùng.
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Trích xuất ngày hết hạn từ token JWT.
     * @param token Token JWT.
     * @return Ngày hết hạn.
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Trích xuất một claim cụ thể từ token bằng hàm phân giải claim.
     * @param token Token JWT.
     * @param claimsResolver Hàm để trích xuất claim mong muốn.
     * @param <T> Kiểu của claim.
     * @return Claim đã trích xuất.
     * @throws JwtException nếu phân tích thất bại.
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Phân tích token JWT và trả về tất cả các claim.
     * Phương thức này vốn đã xác minh chữ ký và hạn sử dụng của token (dựa trên cài đặt trình phân tích).
     * @param token Chuỗi token JWT.
     * @return Các claim được trích xuất từ token.
     * @throws JwtException bao gồm các lỗi phân tích/xác thực khác nhau (SignatureException, ExpiredJwtException, v.v.).
     */
    private Claims extractAllClaims(String token) {
        // Trình phân tích xác minh chữ ký và ngày hết hạn trước khi trả về claim
        return Jwts.parser()
                .verifyWith(getSigningKey()) // Sử dụng đối tượng SecretKey
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Kiểm tra xem token có hết hạn hay không. Lưu ý: extractAllClaims thường tự ném ExpiredJwtException.
     * Điều này có thể hữu ích cho việc kiểm tra *trước* khi phân tích đầy đủ nếu cần ở nơi khác.
     * @param token Token JWT.
     * @return true nếu token đã hết hạn, false nếu ngược lại.
     */
    private Boolean isTokenExpired(String token) {
        try {
            return extractExpiration(token).before(new Date());
        } catch (ExpiredJwtException e) {
            // Nếu chính extractExpiration thất bại do hết hạn, thì chắc chắn là đã hết hạn.
            return true;
        } catch (JwtException e) {
            // Các lỗi phân tích khác có nghĩa là chúng ta không thể xác định hạn sử dụng một cách đáng tin cậy, coi như không hợp lệ/hết hạn.
            logger.warn("Không thể xác định hạn sử dụng token do lỗi phân tích: {}", e.getMessage());
            return true;
        }
    }

    /**
     * Tạo token JWT cho tên người dùng đã cho với các claim mặc định.
     * @param username Subject (tên người dùng) cho token.
     * @return Chuỗi JWT đã tạo.
     */
    public String generateToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        // Thêm bất kỳ claim tiêu chuẩn nào khác ở đây nếu cần
        return createToken(claims, username);
    }

    /**
     * Tạo chuỗi JWT với các claim và subject đã cho.
     * @param claims Các claim tùy chỉnh để đưa vào token.
     * @param subject Subject (tên người dùng) của token.
     * @return Chuỗi JWT đã tạo.
     */
    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs); // Sử dụng thời hạn từ cấu hình

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                // Sử dụng phương thức signWith được khuyến nghị, nhận SecretKey
                .signWith(getSigningKey()) // Thuật toán được suy ra từ loại khóa (HMAC-SHA)
                .compact();
    }

    /**
     * Xác thực token JWT: kiểm tra chữ ký, hạn sử dụng và xem tên người dùng có khớp không.
     * @param token Chuỗi token JWT.
     * @param username Tên người dùng để xác thực với subject của token.
     * @return true nếu token hợp lệ cho người dùng đã cho, false nếu ngược lại.
     */
    public Boolean validateToken(String token, String username) {
        try {
            // Phân tích claims. Việc này xác minh chữ ký và hạn sử dụng.
            Claims claims = extractAllClaims(token);
            // Kiểm tra xem tên người dùng có khớp không và token chưa hết hạn (kiểm tra lại, mặc dù trình phân tích đã xử lý hết hạn)
            String extractedUsername = claims.getSubject();
            return (extractedUsername.equals(username) && !claims.getExpiration().before(new Date()));
            // Lưu ý: Việc kiểm tra `!claims.getExpiration().before(new Date())` hơi thừa
            // vì `extractAllClaims` sẽ ném ExpiredJwtException nếu nó đã hết hạn.
            // Tuy nhiên, giữ lại nó làm cho logic rõ ràng hơn.
        } catch (SignatureException e) {
            logger.error("Chữ ký JWT không hợp lệ: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            logger.error("Token JWT không hợp lệ: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("Token JWT đã hết hạn: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("Token JWT không được hỗ trợ: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("Chuỗi claims JWT trống: {}", e.getMessage());
        } catch (JwtException e) { // Bắt JwtException rộng hơn cho các vấn đề tiềm ẩn khác
            logger.error("Lỗi xác thực JWT: {}", e.getMessage());
        }
        return false; // Trả về false nếu có bất kỳ ngoại lệ nào xảy ra
    }
}