package ke.co.miles.systemsusers.daos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Metadata {

  private Long total;
  private Integer limit;
  private Integer page;
  private Integer firstPage;
  private Integer lastPage;
  private Integer previousPage;
  private Integer nextPage;

}
