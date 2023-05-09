/*
 * Copyright (C) 2021 Second Mile
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */
package ke.co.miles.dissagregations.handlers.get;

import java.util.ArrayList;
import java.util.List;
import ke.co.miles.dissagregations.daos.Metadata;
import ke.co.miles.dissagregations.exceptions.ServerException;
import ke.co.miles.dissagregations.models.Dissagregation;
import ke.co.miles.dissagregations.repository.DissagregationsRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Mono;

/**
 * @author Kwaje Anthony <tony@miles.co.ke>
 * @version 1.0
 * @since 1.0
 */
@Component
@Slf4j
public class RetrieveDissagregationsHandler {

  @Autowired
  DissagregationsRepository repository;

  /**
   * Retrieves dissagregations records
   *
   * @param request the request, dissagregationally containing the query filters of the dissagregations
   *                records to be retrieved and the database from which they should be retrieved
   * @return the stream of responses containing the details of the retrieved dissagregations records
   */
  public Mono<ServerResponse> retrieveDissagregations(ServerRequest request) {

    log.trace("Entering retrieveDissagregations()");

    return
        repository
            .selectTotalDissagregations(request.queryParams())
            .map(total -> this.getMetadata(request.queryParams(), total))
            .flatMap(metadata ->
                ServerResponse
                    .status(HttpStatus.OK)
                    .header("Access-Control-Expose-Headers", "X-Total-Count, Link")
                    .header("X-Total-Count", String.valueOf(metadata.getTotal()))
                    .header("Link", getLinks(request, metadata))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(
                        repository
                            .selectDissagregations(
                                request.queryParams()),
                        Dissagregation.class)
                    .onErrorMap(e -> new ServerException("Entity Type deletion failed", e))
            );
  }

  private String getLinks(ServerRequest request, Metadata metadata) {

    List<String> links = new ArrayList<>();

    if (metadata.getFirstPage() != null) {
      links.add("<"
          + UriComponentsBuilder.fromUri(request.uri())
          .replaceQueryParam("_page", metadata.getFirstPage())
          .replaceQueryParam("_limit", metadata.getLimit() == null ? 20 : metadata.getLimit())
          .toUriString()
          + ">"
          + ";"
          + "rel=\"first\""
      );
    }

    if (metadata.getPreviousPage() != null) {
      links.add("<"
          + UriComponentsBuilder.fromUri(request.uri())
          .replaceQueryParam("_page", metadata.getPreviousPage())
          .replaceQueryParam("_limit", metadata.getLimit() == null ? 20 : metadata.getLimit())
          .toUriString()
          + ">"
          + ";"
          + "rel=\"previous\""
      );
    }

    if (metadata.getNextPage() != null) {
      links.add("<"
          + UriComponentsBuilder.fromUri(request.uri())
          .replaceQueryParam("_page", metadata.getNextPage())
          .replaceQueryParam("_limit", metadata.getLimit() == null ? 20 : metadata.getLimit())
          .toUriString()
          + ">"
          + ";"
          + "rel=\"next\""
      );
    }

    if (metadata.getLastPage() != null) {
      links.add("<"
          + UriComponentsBuilder.fromUri(request.uri())
          .replaceQueryParam("_page", metadata.getLastPage())
          .replaceQueryParam("_limit", metadata.getLimit() == null ? 20 : metadata.getLimit())
          .toUriString()
          + ">"
          + ";"
          + "rel=\"last\""
      );
    }

    return String.join(",", links);

  }

  private Metadata getMetadata(MultiValueMap<String, String> queryParameters, Long total) {

    Integer limit =
        total > 0 ?
            this.getRequestedLimit(queryParameters) :
            null;

    Integer page =
        total > 0 ?
            this.getRequestedPage(queryParameters) :
            null;

    Integer firstPage =
        total > 0 ?
            1 :
            null;

    Integer lastPage =
        (total > 0 && limit != null) ?
            (limit > total ? 1 : ((int) Math.ceil((double) total / limit)) - 1) :
            null;

    Integer previousPage =
        (total > 0 && page != null) ?
            page > 1 ? (page - 1) : null :
            null;

    Integer nextPage =
        (total > 0 && page != null && lastPage != null) ?
            (page + 1) > lastPage ? null : (page + 1) :
            null;

    return Metadata.builder()
        .total(total)
        .limit(limit)
        .page(page)
        .firstPage(firstPage)
        .lastPage(lastPage)
        .previousPage(previousPage)
        .nextPage(nextPage)
        .build();
  }

  private Integer getRequestedPage(MultiValueMap<String, String> queryParameters) {

    Integer page =
        queryParameters.get("_page") == null ? null :
            queryParameters
                .get("_page")
                .stream()
                .findFirst()
                .map(Integer::parseInt)
                .orElse(null);

    return page == null ? null : (page < 1 ? 1 : page);

  }

  private Integer getRequestedLimit(MultiValueMap<String, String> queryParameters) {

    Integer limit =
        queryParameters.get("_limit") == null ? null :
            queryParameters
                .get("_limit")
                .stream()
                .findFirst()
                .map(Integer::parseInt)
                .orElse(null);

    return limit == null ? null : (limit < 1 ? 20 : limit);

  }


}
