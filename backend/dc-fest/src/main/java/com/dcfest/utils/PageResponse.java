package com.dcfest.utils;

import lombok.*;

import java.util.Collection;

@Data
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> {

    private int pageNumber;

    private int pageSize;

    private int totalPages;

    private long totalRecords;

    private Collection<T> content;

}